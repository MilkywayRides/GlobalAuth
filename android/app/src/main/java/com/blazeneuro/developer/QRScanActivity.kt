package com.blazeneuro.developer

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.blazeneuro.developer.api.ApiClient
import com.blazeneuro.developer.api.QRConfirmRequest
import com.blazeneuro.developer.databinding.ActivityQrscanBinding
import com.blazeneuro.developer.utils.PreferenceManager
import com.google.gson.Gson
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanIntentResult
import com.journeyapps.barcodescanner.ScanOptions
import kotlinx.coroutines.launch

data class QRData(
    val type: String,
    val sessionId: String,
    val token: String,
    val domain: String,
    val timestamp: Long
)

class QRScanActivity : AppCompatActivity() {
    private lateinit var binding: ActivityQrscanBinding
    private lateinit var preferenceManager: PreferenceManager
    
    private val barcodeLauncher = registerForActivityResult(ScanContract()) { result: ScanIntentResult ->
        if (result.contents == null) {
            Toast.makeText(this, "Scan cancelled", Toast.LENGTH_SHORT).show()
        } else {
            handleQRResult(result.contents)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityQrscanBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferenceManager = PreferenceManager(this)
        setupUI()
    }
    
    private fun setupUI() {
        binding.apply {
            btnScanQr.setOnClickListener {
                startQRScan()
            }
            
            btnBack.setOnClickListener {
                finish()
            }
        }
    }
    
    private fun startQRScan() {
        val options = ScanOptions().apply {
            setDesiredBarcodeFormats(ScanOptions.QR_CODE)
            setPrompt("Scan QR Code for BlazeNeuro Login")
            setOrientationLocked(true)
            setCameraId(0)
            setBeepEnabled(true)
            setBarcodeImageEnabled(true)
        }
        barcodeLauncher.launch(options)
    }
    
    private fun handleQRResult(qrContent: String) {
        try {
            val qrData = Gson().fromJson(qrContent, QRData::class.java)
            
            if (qrData.type == "blazeneuro_login") {
                showConfirmDialog(qrData)
            } else {
                Toast.makeText(this, "Invalid QR code", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Invalid QR code format", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun showConfirmDialog(qrData: QRData) {
        AlertDialog.Builder(this)
            .setTitle("Login Confirmation")
            .setMessage("Do you want to log in to BlazeNeuro Developer Portal?\n\nDomain: ${qrData.domain}")
            .setPositiveButton("Confirm") { _, _ ->
                confirmLogin(qrData.sessionId)
            }
            .setNegativeButton("Cancel") { _, _ ->
                rejectLogin(qrData.sessionId)
            }
            .setCancelable(false)
            .show()
    }
    
    private fun confirmLogin(sessionId: String) {
        binding.tvStatus.text = "Confirming login..."
        
        lifecycleScope.launch {
            try {
                val user = preferenceManager.getUser()
                if (user == null) {
                    Toast.makeText(this@QRScanActivity, "Please login first", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@QRScanActivity, LoginActivity::class.java))
                    finish()
                    return@launch
                }
                
                // First mark as scanned
                ApiClient.apiService.confirmQR(sessionId, QRConfirmRequest("scan"))
                
                // Then confirm with userId
                val confirmRequest = mapOf(
                    "action" to "confirm",
                    "userId" to user.id
                )
                val response = ApiClient.apiService.confirmQRWithUser(sessionId, confirmRequest)
                
                if (response.isSuccessful) {
                    binding.tvStatus.text = "Login confirmed successfully!"
                    Toast.makeText(this@QRScanActivity, "Login confirmed on web!", Toast.LENGTH_LONG).show()
                    
                    // Go to dashboard
                    startActivity(Intent(this@QRScanActivity, DashboardActivity::class.java))
                    finish()
                } else {
                    binding.tvStatus.text = "Failed to confirm login"
                    Toast.makeText(this@QRScanActivity, "Failed to confirm login", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.tvStatus.text = "Network error"
                Toast.makeText(this@QRScanActivity, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun rejectLogin(sessionId: String) {
        lifecycleScope.launch {
            try {
                ApiClient.apiService.confirmQR(sessionId, QRConfirmRequest("reject"))
                Toast.makeText(this@QRScanActivity, "Login rejected", Toast.LENGTH_SHORT).show()
                finish()
            } catch (e: Exception) {
                Toast.makeText(this@QRScanActivity, "Failed to reject", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

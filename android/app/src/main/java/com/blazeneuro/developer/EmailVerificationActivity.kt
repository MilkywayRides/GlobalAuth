package com.blazeneuro.developer

import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.blazeneuro.developer.api.ApiClient
import com.blazeneuro.developer.databinding.ActivityEmailVerificationBinding
import com.blazeneuro.developer.utils.PreferenceManager
import kotlinx.coroutines.launch

class EmailVerificationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityEmailVerificationBinding
    private lateinit var preferenceManager: PreferenceManager
    private var resendTimer: CountDownTimer? = null
    private var canResend = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEmailVerificationBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferenceManager = PreferenceManager(this)
        
        // Check if already verified
        val user = preferenceManager.getUser()
        if (user?.emailVerified == true) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
            return
        }
        
        setupUI()
        startResendTimer()
        checkVerificationStatus()
    }

    private fun setupUI() {
        val user = preferenceManager.getUser()
        binding.tvEmail.text = user?.email ?: ""

        binding.btnResend.setOnClickListener {
            if (canResend) {
                resendVerificationEmail()
            }
        }

        binding.btnCheckStatus.setOnClickListener {
            checkVerificationStatus()
        }

        binding.btnLogout.setOnClickListener {
            preferenceManager.clearUser()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun startResendTimer() {
        canResend = false
        binding.btnResend.isEnabled = false
        
        resendTimer = object : CountDownTimer(60000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val seconds = millisUntilFinished / 1000
                binding.btnResend.text = "Resend in ${seconds}s"
            }

            override fun onFinish() {
                canResend = true
                binding.btnResend.isEnabled = true
                binding.btnResend.text = "Resend Email"
            }
        }.start()
    }

    private fun resendVerificationEmail() {
        binding.btnResend.isEnabled = false
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.resendVerification()
                
                if (response.isSuccessful) {
                    Toast.makeText(this@EmailVerificationActivity, 
                        "Verification email sent!", Toast.LENGTH_SHORT).show()
                    startResendTimer()
                } else {
                    Toast.makeText(this@EmailVerificationActivity, 
                        "Failed to send email", Toast.LENGTH_SHORT).show()
                    binding.btnResend.isEnabled = true
                }
            } catch (e: Exception) {
                Toast.makeText(this@EmailVerificationActivity, 
                    "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.btnResend.isEnabled = true
            }
        }
    }

    private fun checkVerificationStatus() {
        binding.btnCheckStatus.isEnabled = false
        binding.btnCheckStatus.text = "Checking..."
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getSession()
                
                if (response.isSuccessful) {
                    val user = response.body()?.user
                    if (user?.emailVerified == true) {
                        // Update local user data
                        preferenceManager.updateEmailVerified(true)
                        
                        Toast.makeText(this@EmailVerificationActivity, 
                            "Email verified successfully!", Toast.LENGTH_SHORT).show()
                        
                        // Navigate to dashboard
                        startActivity(Intent(this@EmailVerificationActivity, DashboardActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@EmailVerificationActivity, 
                            "Email not verified yet", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@EmailVerificationActivity, 
                        "Failed to check status", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@EmailVerificationActivity, 
                    "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.btnCheckStatus.isEnabled = true
                binding.btnCheckStatus.text = "Check Status"
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        resendTimer?.cancel()
    }
}

package com.blazeneuro.developer

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.blazeneuro.developer.databinding.ActivityDashboardBinding
import com.blazeneuro.developer.utils.PreferenceManager

class DashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDashboardBinding
    private lateinit var preferenceManager: PreferenceManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferenceManager = PreferenceManager(this)
        setupUI()
    }
    
    private fun setupUI() {
        val user = preferenceManager.getUser()
        
        binding.apply {
            tvWelcome.text = "Welcome, ${user?.name ?: "User"}!"
            tvEmail.text = user?.email ?: ""
            tvRole.text = "Role: ${user?.role ?: "user"}"
            
            btnLogout.setOnClickListener {
                preferenceManager.logout()
                startActivity(Intent(this@DashboardActivity, MainActivity::class.java))
                finish()
            }
            
            btnQrScan.setOnClickListener {
                startActivity(Intent(this@DashboardActivity, QRScanActivity::class.java))
            }
        }
    }
}

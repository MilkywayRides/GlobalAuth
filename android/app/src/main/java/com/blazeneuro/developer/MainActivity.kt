package com.blazeneuro.developer

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.blazeneuro.developer.databinding.ActivityMainBinding
import com.blazeneuro.developer.utils.PreferenceManager

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var preferenceManager: PreferenceManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferenceManager = PreferenceManager(this)
        
        // Check if user is already logged in
        if (preferenceManager.isLoggedIn()) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
            return
        }
        
        setupUI()
    }
    
    private fun setupUI() {
        binding.apply {
            btnLogin.setOnClickListener {
                startActivity(Intent(this@MainActivity, LoginActivity::class.java))
            }
            
            btnSignup.setOnClickListener {
                startActivity(Intent(this@MainActivity, SignupActivity::class.java))
            }
            
            btnQrScan.setOnClickListener {
                startActivity(Intent(this@MainActivity, QRScanActivity::class.java))
            }
        }
    }
}

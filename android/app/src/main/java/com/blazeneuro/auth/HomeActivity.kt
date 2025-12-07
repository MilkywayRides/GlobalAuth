package com.blazeneuro.auth

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.blazeneuro.auth.databinding.ActivityHomeBinding

class HomeActivity : AppCompatActivity() {
    private lateinit var binding: ActivityHomeBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        loadUserInfo()
        
        binding.btnLogout.setOnClickListener {
            logout()
        }
    }
    
    private fun loadUserInfo() {
        val prefs = getSharedPreferences("user_prefs", MODE_PRIVATE)
        val userName = prefs.getString("user_name", "User")
        val userEmail = prefs.getString("user_email", "user@example.com")
        
        binding.tvUserName.text = userName
        binding.tvUserEmail.text = userEmail
    }
    
    private fun logout() {
        getSharedPreferences("user_prefs", MODE_PRIVATE)
            .edit()
            .clear()
            .apply()
        
        startActivity(Intent(this, AuthActivity::class.java))
        finish()
    }
}

package com.blazeneuro.auth

import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.blazeneuro.auth.databinding.ActivityAuthBinding

class AuthActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAuthBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.btnLogin.setOnClickListener {
            if (isNetworkAvailable()) {
                startOAuthFlow("login")
            } else {
                showNetworkError()
            }
        }
        
        binding.btnSignup.setOnClickListener {
            if (isNetworkAvailable()) {
                startOAuthFlow("signup")
            } else {
                showNetworkError()
            }
        }
        
        binding.btnOAuth.setOnClickListener {
            if (isNetworkAvailable()) {
                startOAuthFlow("login")
            } else {
                showNetworkError()
            }
        }
    }
    
    private fun isNetworkAvailable(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
    
    private fun showNetworkError() {
        Toast.makeText(this, "Please connect to internet", Toast.LENGTH_SHORT).show()
    }
    
    private fun startOAuthFlow(type: String) {
        val intent = Intent(this, WebAuthActivity::class.java)
        intent.putExtra("auth_type", type)
        startActivity(intent)
    }
}

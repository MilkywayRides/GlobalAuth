package com.blazeneuro.developer

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.blazeneuro.developer.api.ApiClient
import com.blazeneuro.developer.api.LoginRequest
import com.blazeneuro.developer.databinding.ActivityLoginBinding
import com.blazeneuro.developer.utils.PreferenceManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private lateinit var preferenceManager: PreferenceManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferenceManager = PreferenceManager(this)
        setupUI()
    }
    
    private fun setupUI() {
        binding.apply {
            btnLogin.setOnClickListener {
                val email = etEmail.text.toString().trim()
                val password = etPassword.text.toString().trim()
                
                if (email.isEmpty() || password.isEmpty()) {
                    Toast.makeText(this@LoginActivity, "Please fill all fields", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                
                login(email, password)
            }
            
            tvSignup.setOnClickListener {
                startActivity(Intent(this@LoginActivity, SignupActivity::class.java))
                finish()
            }
            
            btnQrLogin.setOnClickListener {
                startActivity(Intent(this@LoginActivity, QRScanActivity::class.java))
            }
        }
    }
    
    private fun login(email: String, password: String) {
        binding.btnLogin.isEnabled = false
        binding.btnLogin.text = "Signing in..."
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.login(LoginRequest(email, password))
                
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body?.success == true && body.user != null && body.token != null) {
                        preferenceManager.saveUser(body.user, body.token)
                        
                        Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, 
                            body?.message ?: "Login failed", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    val errorBody = response.errorBody()?.string()
                    Toast.makeText(this@LoginActivity, 
                        "Login failed: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(this@LoginActivity, 
                    "Error: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
            } finally {
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = "Sign In"
            }
        }
    }
}

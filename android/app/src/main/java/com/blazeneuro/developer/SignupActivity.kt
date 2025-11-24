package com.blazeneuro.developer

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.blazeneuro.developer.api.ApiClient
import com.blazeneuro.developer.api.SignupRequest
import com.blazeneuro.developer.databinding.ActivitySignupBinding
import com.blazeneuro.developer.utils.PreferenceManager
import kotlinx.coroutines.launch

class SignupActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignupBinding
    private lateinit var preferenceManager: PreferenceManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferenceManager = PreferenceManager(this)
        setupUI()
    }
    
    private fun setupUI() {
        binding.apply {
            btnSignup.setOnClickListener {
                val name = etName.text.toString().trim()
                val email = etEmail.text.toString().trim()
                val password = etPassword.text.toString().trim()
                
                if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                    Toast.makeText(this@SignupActivity, "Please fill all fields", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                
                signup(name, email, password)
            }
            
            tvLogin.setOnClickListener {
                startActivity(Intent(this@SignupActivity, LoginActivity::class.java))
                finish()
            }
        }
    }
    
    private fun signup(name: String, email: String, password: String) {
        binding.btnSignup.isEnabled = false
        binding.btnSignup.text = "Creating account..."
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.signup(SignupRequest(name, email, password))
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val user = response.body()?.user
                    val token = response.body()?.token
                    
                    if (user != null && token != null) {
                        preferenceManager.saveUser(user, token)
                        
                        Toast.makeText(this@SignupActivity, "Account created successfully!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@SignupActivity, DashboardActivity::class.java))
                        finish()
                    }
                } else {
                    Toast.makeText(this@SignupActivity, 
                        response.body()?.message ?: "Signup failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@SignupActivity, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.btnSignup.isEnabled = true
                binding.btnSignup.text = "Create Account"
            }
        }
    }
}

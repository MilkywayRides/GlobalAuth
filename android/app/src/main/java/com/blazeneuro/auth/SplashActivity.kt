package com.blazeneuro.auth

import android.content.Intent
import android.os.Bundle
import android.view.animation.AnimationUtils
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.SplashTheme)
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            delay(2000)
            val isFirstTime = getSharedPreferences("app_prefs", MODE_PRIVATE)
                .getBoolean("first_time", true)
            
            val intent = if (isFirstTime) {
                Intent(this@SplashActivity, OnboardingActivity::class.java)
            } else {
                Intent(this@SplashActivity, AuthActivity::class.java)
            }
            startActivity(intent)
            finish()
        }
    }
}

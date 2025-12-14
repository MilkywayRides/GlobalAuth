package com.blazeneuro.auth

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.viewpager2.widget.ViewPager2
import com.blazeneuro.developer.databinding.ActivityOnboardingBinding

class OnboardingActivity : AppCompatActivity() {
    private lateinit var binding: ActivityOnboardingBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        val adapter = OnboardingAdapter()
        binding.viewPager.adapter = adapter
        
        binding.btnNext.setOnClickListener {
            if (binding.viewPager.currentItem < 2) {
                binding.viewPager.currentItem++
            } else {
                getSharedPreferences("app_prefs", MODE_PRIVATE)
                    .edit().putBoolean("first_time", false).apply()
                startActivity(Intent(this, AuthActivity::class.java))
                finish()
            }
        }
        
        binding.viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                binding.btnNext.text = if (position == 2) "Get Started" else "Next"
            }
        })
    }
}

package com.blazeneuro.developer

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.viewpager2.widget.ViewPager2
import com.blazeneuro.developer.databinding.ActivityOnboardingBinding
import com.blazeneuro.developer.utils.PreferenceManager

class OnboardingActivity : AppCompatActivity() {
    private lateinit var binding: ActivityOnboardingBinding
    private lateinit var preferenceManager: PreferenceManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferenceManager = PreferenceManager(this)
        
        if (preferenceManager.isOnboardingCompleted()) {
            navigateToMain()
            return
        }
        
        setupViewPager()
    }
    
    private fun setupViewPager() {
        val adapter = OnboardingAdapter()
        binding.viewPager.adapter = adapter
        
        binding.dotsIndicator.attachTo(binding.viewPager)
        
        binding.viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                if (position == 2) {
                    binding.btnNext.text = "Get Started"
                } else {
                    binding.btnNext.text = "Next"
                }
            }
        })
        
        binding.btnNext.setOnClickListener {
            if (binding.viewPager.currentItem < 2) {
                binding.viewPager.currentItem += 1
            } else {
                preferenceManager.setOnboardingCompleted()
                navigateToMain()
            }
        }
        
        binding.btnSkip.setOnClickListener {
            preferenceManager.setOnboardingCompleted()
            navigateToMain()
        }
    }
    
    private fun navigateToMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}

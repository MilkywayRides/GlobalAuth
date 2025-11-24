package com.blazeneuro.developer

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.blazeneuro.developer.databinding.ItemOnboardingBinding

data class OnboardingItem(
    val title: String,
    val description: String,
    val icon: Int
)

class OnboardingAdapter : RecyclerView.Adapter<OnboardingAdapter.OnboardingViewHolder>() {
    
    private val items = listOf(
        OnboardingItem(
            "Secure Authentication",
            "Login securely with email or scan QR codes for instant access to your developer portal",
            android.R.drawable.ic_lock_lock
        ),
        OnboardingItem(
            "QR Code Login",
            "Scan QR codes from your computer to instantly authenticate without typing passwords",
            android.R.drawable.ic_menu_camera
        ),
        OnboardingItem(
            "Developer Dashboard",
            "Access your API keys, monitor usage, and manage your applications on the go",
            android.R.drawable.ic_menu_manage
        )
    )
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OnboardingViewHolder {
        val binding = ItemOnboardingBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return OnboardingViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: OnboardingViewHolder, position: Int) {
        holder.bind(items[position])
    }
    
    override fun getItemCount() = items.size
    
    class OnboardingViewHolder(private val binding: ItemOnboardingBinding) :
        RecyclerView.ViewHolder(binding.root) {
        
        fun bind(item: OnboardingItem) {
            binding.tvTitle.text = item.title
            binding.tvDescription.text = item.description
            binding.ivIcon.setImageResource(item.icon)
        }
    }
}

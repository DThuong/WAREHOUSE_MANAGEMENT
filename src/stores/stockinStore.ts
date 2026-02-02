// stockinStore.ts
import { defineStore } from "pinia"
import { ref } from "vue"
import type { Stockin } from "@/types/stockin.types"

export const useStockinStore = defineStore('stockin', () => {
    // State
    const stockins = ref<Stockin[]>([])
    const currentStockin = ref<Stockin | null>(null)
    const loading = ref(false)
    const uploadingImages = ref(false)
    const deletingImage = ref(false)
    const error = ref<string | null>(null)

    // Actions
    const setStockins = (data: Stockin[]) => {
        stockins.value = data
    }

    const setCurrentStockin = (data: Stockin | null) => {
        currentStockin.value = data
    }

    const setLoading = (status: boolean) => {
        loading.value = status
    }

    const setUploadingImages = (status: boolean) => {
        uploadingImages.value = status
    }

    const setDeletingImage = (status: boolean) => {
        deletingImage.value = status
    }

    const setError = (err: string | null) => {
        error.value = err
    }

    return {
        stockins,
        currentStockin,
        loading,
        uploadingImages,
        deletingImage,
        error,
        setStockins,
        setCurrentStockin,
        setLoading,
        setUploadingImages,
        setDeletingImage,
        setError
    }
})
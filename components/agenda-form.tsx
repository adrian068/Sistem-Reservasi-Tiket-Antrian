"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface AgendaFormProps {
  formData: {
    title: string
    slug: string
    description: string
    date: string
    time: string
    location: string
    address: string
    organizer: string
    capacity: number
    category: string
    registrationFee: string
    contactPerson: string
    imageUrl: string
    status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  }
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string
    slug: string
    description: string
    date: string
    time: string
    location: string
    address: string
    organizer: string
    capacity: number
    category: string
    registrationFee: string
    contactPerson: string
    imageUrl: string
    status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  }>>
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  initialImageUrl?: string
}

export function AgendaForm({ formData, setFormData, onSubmit, onCancel, initialImageUrl }: AgendaFormProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null)

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ File uploaded successfully:', result.data.url)
        console.log('📦 Updating formData.imageUrl to:', result.data.url)
        console.log('📦 Current formData:', formData)
        setFormData({ ...formData, imageUrl: result.data.url })
        setUploadedFile(file)
        setPreviewUrl(result.data.url)
      } else {
        alert(result.message || 'Gagal mengupload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal mengupload file')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' })
    setUploadedFile(null)
    setPreviewUrl(null)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Judul Agenda *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="Akan dibuat otomatis jika kosong"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Tanggal *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time">Waktu *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Lokasi *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Alamat Lengkap</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="organizer">Penyelenggara</Label>
          <Input
            id="organizer"
            value={formData.organizer}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="capacity">Kapasitas</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Kategori</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
              <SelectItem value="Pelatihan">Pelatihan</SelectItem>
              <SelectItem value="Kompetisi">Kompetisi</SelectItem>
              <SelectItem value="Rapat">Rapat</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="registrationFee">Biaya Pendaftaran</Label>
          <Input
            id="registrationFee"
            value={formData.registrationFee}
            onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contactPerson">Kontak</Label>
        <Input
          id="contactPerson"
          value={formData.contactPerson}
          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          placeholder="Email atau nomor telepon"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image">Foto Agenda</Label>
        <div className="space-y-3">
          {/* File Upload Input */}
          <div className="flex items-center gap-4">
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-text-navy hover:file:bg-blue-100"
            />
            {uploading && (
              <div className="text-sm text-brand-accent flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
                Mengupload...
              </div>
            )}
          </div>

          {/* Preview Image */}
          {(previewUrl || formData.imageUrl) && (
            <div className="relative inline-block">
              <img
                src={previewUrl || formData.imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Upload Instructions */}
          <div className="text-sm text-muted-foreground">
            <p>• Format yang didukung: JPG, PNG, WebP</p>
            <p>• Ukuran maksimal: 5MB</p>
            <p>• Resolusi disarankan: minimal 400x300px</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED') => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
            <SelectItem value="ONGOING">Berlangsung</SelectItem>
            <SelectItem value="COMPLETED">Selesai</SelectItem>
            <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="bg-brand-primary hover:bg-brand-accent-hover">
          Simpan Agenda
        </Button>
      </div>
    </form>
  )
}

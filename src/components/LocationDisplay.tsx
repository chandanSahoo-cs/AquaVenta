"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"

interface LocationDisplayProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  className?: string
}

export function LocationDisplay({ latitude, longitude, className }: LocationDisplayProps) {
  const [address, setAddress] = useState("Loading location...")

  useEffect(() => {
    if (latitude && longitude) {
      const fetchAddress = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          )
          const data = await response.json()
          if (data && data.display_name) {
            setAddress(data.display_name)
          } else {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error)
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
      }
      fetchAddress()
    } else {
      setAddress("Location not available")
    }
  }, [latitude, longitude])

  return (
    <p className={className}>
      <MapPin className="inline-block w-4 h-4 mr-1" />
      {address}
    </p>
  )
}
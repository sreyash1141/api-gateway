import { useState, useEffect } from 'react'

function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0)
  const numValue = parseInt(value)

  useEffect(() => {
    if (isNaN(numValue)) return

    let start = 0
    const increment = numValue / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= numValue) {
        setDisplay(numValue)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [numValue, duration])

  if (isNaN(numValue)) return <span>{value}</span>
  return <span>{display}</span>
}

export default AnimatedNumber
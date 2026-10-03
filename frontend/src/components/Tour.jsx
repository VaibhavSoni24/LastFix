import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startTour() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 8,
    stageRadius: 14,
    steps: [
      {
        element: '#tour-search',
        popover: {
          title: 'Ask LastFix',
          description: 'Have a problem again? Type what broke. LastFix searches your personal history to find what actually worked last time.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-log-fix',
        popover: {
          title: 'Log a Fix in Plain English',
          description: 'Describe what happened in natural language. Local AI automatically infers your OS, device, and extracts each attempt and outcome.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-history',
        popover: {
          title: 'Your Fix Memory Vault',
          description: 'Explore your past incidents, inspect step-by-step attempts, and observe what failed so you never repeat dead-end steps.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#tour-settings',
        popover: {
          title: '100% Local or Cloud AI',
          description: 'Runs Gemma 3 4B locally via Ollama by default. You can also paste Gemini, Groq, Mercury, OpenAI, or Claude keys with zero updates needed.',
          side: 'bottom',
          align: 'end'
        }
      }
    ]
  })

  driverObj.drive()
}

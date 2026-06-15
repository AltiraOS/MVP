export interface JourneyStep {
  path: string
  label: string
  number: number
}

export const JOURNEY_STEPS: JourneyStep[] = [
  { path: '/brief', label: 'Brief', number: 1 },
  { path: '/shape', label: 'Shape', number: 2 },
  { path: '/summary', label: 'Summary', number: 3 },
  { path: '/pricing', label: 'Pricing', number: 4 },
  { path: '/activate', label: 'Activate', number: 5 },
]

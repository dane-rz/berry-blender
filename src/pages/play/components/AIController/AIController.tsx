import { useAIPlayer, type UseAIPlayerParams } from '../../hooks/useAIPlayer'

// A component so we can render however many AIs we want — you can't call a hook
// in a loop, but you can mount a component in one. Just a driver, draws nothing.
export default function AIController(props: UseAIPlayerParams) {
  useAIPlayer(props)
  return null
}

import { useAllDexes, useExcludeDexes } from 'state/customizeDexes/hooks'

const useSelectedDexes = () => {
  const allDexes = useAllDexes()
  const [excludeDexes] = useExcludeDexes()

  const selectedDexes = allDexes?.filter(item => !excludeDexes.includes(item.id)).map(item => item.id)

  const dexes =
    selectedDexes?.length === allDexes?.length
      ? ''
      : selectedDexes?.join(',').replace('zuluswapv1', 'zuluswap,zuluswap-static') || ''

  return dexes
}

export default useSelectedDexes

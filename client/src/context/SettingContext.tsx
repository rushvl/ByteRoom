import useLocalStorage from "@/hooks/useLocalStorage"
import {
    Settings,
    SettingsContext as SettingsContextType,
} from "@/types/setting"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"

const SettingContext = createContext<SettingsContextType | null>(null)

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingContext)
    if (!context) {
        throw new Error(
            "useSettings must be used within a SettingContextProvider",
        )
    }
    return context
}

// ✅ Set default to "Cpp" with capital C
const defaultSettings: Settings = {
    theme: "Dracula",
    language: "Cpp",
    fontSize: 16,
    fontFamily: "Space Mono",
    showGitHubCorner: true,
}

function SettingContextProvider({ children }: { children: ReactNode }) {
    const { getItem } = useLocalStorage()

    // ✅ Always override language to "Cpp"
    const storedSettings: Partial<Settings> = (() => {
        const raw = getItem("settings")
        if (!raw) {
            return { ...defaultSettings }
        }

        try {
            const parsed = JSON.parse(raw)

            // 👇 Force Cpp no matter what
            parsed.language = "Cpp"

            return {
                theme: parsed.theme ?? defaultSettings.theme,
                language: "Cpp",
                fontSize: parsed.fontSize ?? defaultSettings.fontSize,
                fontFamily: parsed.fontFamily ?? defaultSettings.fontFamily,
                showGitHubCorner:
                    parsed.showGitHubCorner ?? defaultSettings.showGitHubCorner,
            }
        } catch (e) {
            return { ...defaultSettings }
        }
    })()

    const [theme, setTheme] = useState<string>(storedSettings.theme!)
    const [language, setLanguage] = useState<string>("Cpp") // ✅ always start with Cpp
    const [fontSize, setFontSize] = useState<number>(storedSettings.fontSize!)
    const [fontFamily, setFontFamily] = useState<string>(storedSettings.fontFamily!)
    const [showGitHubCorner, setShowGitHubCorner] = useState<boolean>(
        storedSettings.showGitHubCorner!,
    )

    const resetSettings = () => {
        setTheme(defaultSettings.theme)
        setLanguage("Cpp")
        setFontSize(defaultSettings.fontSize)
        setFontFamily(defaultSettings.fontFamily)
        setShowGitHubCorner(defaultSettings.showGitHubCorner)
    }

    // ✅ Save updated settings (always writing "Cpp")
    useEffect(() => {
        const updatedSettings: Settings = {
            theme,
            language: "Cpp",
            fontSize,
            fontFamily,
            showGitHubCorner,
        }

        localStorage.setItem("settings", JSON.stringify(updatedSettings))
    }, [theme, language, fontSize, fontFamily, showGitHubCorner])

    return (
        <SettingContext.Provider
            value={{
                theme,
                setTheme,
                language,
                setLanguage,
                fontSize,
                setFontSize,
                fontFamily,
                setFontFamily,
                showGitHubCorner,
                setShowGitHubCorner,
                resetSettings,
            }}
        >
            {children}
        </SettingContext.Provider>
    )
}

export { SettingContextProvider }
export default SettingContext

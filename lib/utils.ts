/**
 * iOS PWA 鍵盤焦點修復補丁
 * 目的：解決 iOS Safari PWA 模式下，鍵盤彈出遮擋或焦點丟失的問題。
 * 優化：
 * 1. 檢測環境：只在 iOS + Standalone (PWA) 下執行。
 * 2. 精準觸發：只在點擊 Input/Textarea 時觸發，不干擾捲動。
 * 3. 狀態鎖定：防止重複觸發導致的閃爍。
 * 4. 游標保護：嘗試還原使用者的輸入位置。
 */
export function initIOSKeyboardFocusFix() {
    // 1. 環境檢測：如果不是 iOS PWA，直接結束，節省效能
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    if (!isiOS || !isPWA) return;

    // 2. 定義修復邏輯
    const fixFocus = (el: HTMLInputElement | HTMLTextAreaElement) => {
        // 避免短時間內重複觸發 (Mutex Lock)
        if (el.dataset._focusFixed) return;
        el.dataset._focusFixed = "true";

        // 延遲執行，讓原本的事件流走完
        setTimeout(() => {
            const currentStart = el.selectionStart;
            const currentEnd = el.selectionEnd;

            // 強制重繪焦點
            el.blur();

            setTimeout(() => {
                // preventScroll: true 非常重要，避免瀏覽器自作聰明亂跳畫面
                el.focus({ preventScroll: true });

                // 嘗試還原游標位置
                try {
                    if (typeof currentStart === 'number') {
                        el.setSelectionRange(currentStart, currentEnd);
                    }
                } catch (e) {
                    // 部分 input type 不支援 selectionRange，忽略錯誤
                }

                // 2秒後解鎖，允許再次觸發補救
                setTimeout(() => delete el.dataset._focusFixed, 2000);
            }, 50); // 50ms 是經驗值，給鍵盤動畫一點緩衝
        }, 0);
    };

    // 3. 使用 pointerup 代替 touchend
    // pointerup 兼容性更好，且能區分是「點擊」還是「滑動結束」
    document.addEventListener("pointerup", (e) => {
        const el = e.target as HTMLElement;
        // 使用 closest 確保有點到輸入框
        const inputEl = el?.closest?.("input, textarea") as HTMLInputElement | HTMLTextAreaElement;

        if (inputEl) {
            fixFocus(inputEl);
        }
    }, true); // 使用 Capture 階段確保優先執行
}

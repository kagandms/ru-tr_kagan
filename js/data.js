/**
 * Kelime Verileri
 * Her kelime şu yapıda olmalı:
 * {
 *   id: number,
 *   russian: string,       // Rusça kelime
 *   turkish: string,       // Türkçe çeviri
 *   example: {
 *     russian: string,     // Rusça örnek cümle
 *     turkish: string      // Türkçe örnek cümle
 *   }
 * }
 */

const WORDS = [
    // Örnek kelimeler - sen kendi kelimelerini paylaşınca bunları değiştireceğiz
    {
        id: 1,
        russian: "Привет",
        turkish: "Merhaba",
        example: {
            russian: "Привет, как дела?",
            turkish: "Merhaba, nasılsın?"
        }
    },
    {
        id: 2,
        russian: "Спасибо",
        turkish: "Teşekkürler",
        example: {
            russian: "Спасибо за помощь!",
            turkish: "Yardım için teşekkürler!"
        }
    },
    {
        id: 3,
        russian: "Пожалуйста",
        turkish: "Rica ederim / Lütfen",
        example: {
            russian: "Пожалуйста, садитесь.",
            turkish: "Lütfen oturun."
        }
    },
    {
        id: 4,
        russian: "Да",
        turkish: "Evet",
        example: {
            russian: "Да, я понимаю.",
            turkish: "Evet, anlıyorum."
        }
    },
    {
        id: 5,
        russian: "Нет",
        turkish: "Hayır",
        example: {
            russian: "Нет, спасибо.",
            turkish: "Hayır, teşekkürler."
        }
    },
    {
        id: 6,
        russian: "Хорошо",
        turkish: "İyi / Tamam",
        example: {
            russian: "Всё хорошо.",
            turkish: "Her şey iyi."
        }
    },
    {
        id: 7,
        russian: "Доброе утро",
        turkish: "Günaydın",
        example: {
            russian: "Доброе утро! Как спалось?",
            turkish: "Günaydın! Nasıl uyudun?"
        }
    },
    {
        id: 8,
        russian: "До свидания",
        turkish: "Hoşça kal",
        example: {
            russian: "До свидания, увидимся завтра.",
            turkish: "Hoşça kal, yarın görüşürüz."
        }
    },
    {
        id: 9,
        russian: "Извините",
        turkish: "Özür dilerim",
        example: {
            russian: "Извините, я опоздал.",
            turkish: "Özür dilerim, geç kaldım."
        }
    },
    {
        id: 10,
        russian: "Я люблю тебя",
        turkish: "Seni seviyorum",
        example: {
            russian: "Я люблю тебя всем сердцем.",
            turkish: "Seni tüm kalbimle seviyorum."
        }
    }
];

/**
 * Favori Kelime Yönetimi
 */

class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem('favorites');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    isFavorite(wordId) {
        return this.favorites.includes(wordId);
    }

    toggleFavorite(wordId) {
        if (this.isFavorite(wordId)) {
            this.favorites = this.favorites.filter(id => id !== wordId);
        } else {
            this.favorites.push(wordId);
        }
        this.saveFavorites();
        return this.isFavorite(wordId);
    }

    getFavorites() {
        return this.favorites;
    }

    getFavoriteWords() {
        const mainFavs = WORDS.filter(word => this.isFavorite(word.id));
        // Include IELTS favorites (stored with 'ielts_' prefix)
        const ieltsData = Array.isArray(window.IELTS_DATA) ? window.IELTS_DATA : [];
        const ieltsFavs = ieltsData
            .filter(word => this.isFavorite('ielts_' + word.en))
            .map(w => ({ id: 'ielts_' + w.en, russian: w.ru, turkish: w.tr, english: w.en }));
        return [...mainFavs, ...ieltsFavs];
    }
}

window.favoritesManager = new FavoritesManager();

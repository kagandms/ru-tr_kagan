/**
 * Favori Kelime Yönetimi
 */

class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
    }

    loadFavorites() {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
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
        return WORDS.filter(word => this.isFavorite(word.id));
    }
}

window.favoritesManager = new FavoritesManager();

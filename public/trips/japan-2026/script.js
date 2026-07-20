(function () {
	'use strict';

	var LEG_ORDER = ['tokyo-bay', 'hakone', 'osaka', 'tokyo'];
	var LEG_LABELS = {
		'tokyo-bay': 'Tokyo Bay & Disney',
		hakone: 'Hakone',
		osaka: 'Osaka',
		tokyo: 'Tokyo',
	};
	var PHOTOS_PER_LEG = 4;
	var PLACEHOLDER_COUNT = 20;

	function placeholderPool() {
		var pool = [];
		for (var i = 1; i <= PLACEHOLDER_COUNT; i++) {
			pool.push({
				src: 'https://placehold.co/800x600?text=Photo+' + i,
				alt: 'Placeholder photo ' + i,
				leg: null,
			});
		}
		return pool;
	}

	// Filenames may optionally start with a leg slug ("hakone-01.jpg",
	// "osaka_dotonbori.jpg") to pin a photo to that section. Anything else
	// is treated as unassigned and spread evenly across the legs.
	function parseManifest(filenames) {
		var sorted = filenames.slice().sort();
		return sorted.map(function (name) {
			var lower = name.toLowerCase();
			var leg = null;
			for (var i = 0; i < LEG_ORDER.length; i++) {
				var slug = LEG_ORDER[i];
				if (lower.indexOf(slug + '-') === 0 || lower.indexOf(slug + '_') === 0) {
					leg = slug;
					break;
				}
			}
			return {
				src: 'photos/' + name,
				alt: leg ? LEG_LABELS[leg] + ' photo' : 'Japan trip photo',
				leg: leg,
			};
		});
	}

	function assignLegPhotos(pool) {
		var assignments = {};
		var untagged = [];
		LEG_ORDER.forEach(function (leg) {
			assignments[leg] = pool.filter(function (p) {
				return p.leg === leg;
			});
		});
		pool.forEach(function (p) {
			if (!p.leg) untagged.push(p);
		});

		var cursor = 0;
		LEG_ORDER.forEach(function (leg) {
			var needed = PHOTOS_PER_LEG - assignments[leg].length;
			for (var i = 0; i < needed && untagged.length > 0; i++) {
				assignments[leg].push(untagged[cursor % untagged.length]);
				cursor++;
			}
			assignments[leg] = assignments[leg].slice(0, PHOTOS_PER_LEG);
		});

		return assignments;
	}

	function renderLegPhotos(assignments) {
		LEG_ORDER.forEach(function (leg) {
			var container = document.querySelector('.leg-photos[data-leg="' + leg + '"]');
			if (!container) return;
			assignments[leg].forEach(function (photo) {
				var img = document.createElement('img');
				img.src = photo.src;
				img.alt = photo.alt;
				img.loading = 'lazy';
				container.appendChild(img);
			});
		});
	}

	function renderGallery(pool) {
		var grid = document.getElementById('galleryGrid');
		if (!grid) return;
		pool.forEach(function (photo, index) {
			var img = document.createElement('img');
			img.src = photo.src;
			img.alt = photo.alt;
			img.loading = 'lazy';
			img.dataset.index = String(index);
			img.addEventListener('click', function () {
				openLightbox(index);
			});
			grid.appendChild(img);
		});
	}

	function setHero(pool) {
		var hero = document.getElementById('heroPhoto');
		if (!hero || pool.length === 0) return;
		hero.src = pool[0].src;
		hero.alt = pool[0].alt;
	}

	// Lightbox
	var galleryPool = [];
	var currentIndex = 0;
	var lightbox, lightboxImage, lightboxCaption;

	function openLightbox(index) {
		currentIndex = index;
		updateLightbox();
		lightbox.hidden = false;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		lightbox.hidden = true;
		document.body.style.overflow = '';
	}

	function updateLightbox() {
		var photo = galleryPool[currentIndex];
		lightboxImage.src = photo.src;
		lightboxImage.alt = photo.alt;
		lightboxCaption.textContent = photo.alt + ' (' + (currentIndex + 1) + ' of ' + galleryPool.length + ')';
	}

	function showNext() {
		currentIndex = (currentIndex + 1) % galleryPool.length;
		updateLightbox();
	}

	function showPrev() {
		currentIndex = (currentIndex - 1 + galleryPool.length) % galleryPool.length;
		updateLightbox();
	}

	function initLightbox(pool) {
		galleryPool = pool;
		lightbox = document.getElementById('lightbox');
		lightboxImage = document.getElementById('lightboxImage');
		lightboxCaption = document.getElementById('lightboxCaption');

		document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
		document.getElementById('lightboxNext').addEventListener('click', showNext);
		document.getElementById('lightboxPrev').addEventListener('click', showPrev);

		lightbox.addEventListener('click', function (e) {
			if (e.target === lightbox) closeLightbox();
		});

		document.addEventListener('keydown', function (e) {
			if (lightbox.hidden) return;
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowRight') showNext();
			if (e.key === 'ArrowLeft') showPrev();
		});
	}

	function buildPage(pool) {
		var assignments = assignLegPhotos(pool);
		renderLegPhotos(assignments);
		renderGallery(pool);
		setHero(pool);
		initLightbox(pool);
	}

	function init() {
		fetch('photos.json')
			.then(function (res) {
				if (!res.ok) throw new Error('no manifest');
				return res.json();
			})
			.then(function (filenames) {
				if (!Array.isArray(filenames) || filenames.length === 0) {
					throw new Error('empty manifest');
				}
				buildPage(parseManifest(filenames));
			})
			.catch(function () {
				buildPage(placeholderPool());
			});
	}

	document.addEventListener('DOMContentLoaded', init);
})();

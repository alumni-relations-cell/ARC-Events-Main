import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import Masonry from "react-masonry-css";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { apiUser } from "../../lib/apiUser";
import LazyImage from "../../components/LazyImage";
import { useEventLock } from "../../context/EventLockContext";

const PAGE_SIZE = 24;

export default function PhotoGallery() {
  const { eventSlug } = useParams();
  const { isLocked, eventData } = useEventLock();

  // --- STATE: MODE SWITCHING ---
  // If null, show Event List. If set, show Gallery for that event.
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Auto-select event if locked or slug provided
  useEffect(() => {
    if (isLocked && eventData) {
      setSelectedEvent(eventData);
    } else if (eventSlug && !selectedEvent) {
      // If valid slug in URL but not locked (direct access), set minimal event data
      // We might want to fetch full details, but for now assuming slug is enough or finding from list
      setSelectedEvent({ slug: eventSlug, name: "Event Memories" });
      // Note: fetching full details for name would be better, but this solves the immediate navigation
    }
  }, [isLocked, eventData, eventSlug]);

  // --- STATE: GALLERY INTERNALS ---
  const [photos, setPhotos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  // =========================================================
  // 1. FETCH EVENT LIST (Directory Mode)
  // =========================================================
  useEffect(() => {
    // Only fetch list if we aren't looking at a specific gallery
    if (!selectedEvent) {
      setIsLoadingEvents(true);
      apiUser
        .get("/api/events/ongoing")
        .then((res) => {
          const data = res.data;
          setEventsList(Array.isArray(data) ? data : []);
        })
        .catch((e) => {
          console.error("Failed to load events:", e);
          setEventsList([]);
        })
        .finally(() => setIsLoadingEvents(false));
    }
  }, [selectedEvent]);

  // =========================================================
  // 2. FETCH PHOTOS (Gallery Mode)
  // =========================================================
  useEffect(() => {
    if (!selectedEvent) {
      setPhotos([]); // Clear photos when going back
      return;
    }

    // Fetch memories for the specific selected event
    apiUser.get(`/api/events/${selectedEvent.slug}/memories`)
      .then((res) => {
        console.log("Memory API Response:", res.data); // DEBUG
        const data = Array.isArray(res.data) ? res.data : [];
        setPhotos(shuffleArray(data));
        setVisibleCount(PAGE_SIZE);
      })
      .catch((err) => console.error("Error fetching gallery images:", err));
  }, [selectedEvent]);

  // =========================================================
  // HELPER FUNCTIONS (Preserved from your original code)
  // =========================================================
  const shuffleArray = (arr) => {
    const array = Array.isArray(arr) ? [...arr] : [];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const cldTransform = (url, transforms) => {
    if (!url || !url.includes("/upload/")) return url;
    const t = transforms.filter(Boolean).join(",");
    return url.replace("/upload/", `/upload/${t}/`);
  };

  const placeholderUrl = (url) => cldTransform(url, ["f_auto", "q_1", "e_blur:2000", "w_20", "dpr_auto"]);

  const buildImageSources = (url) => {
    const widths = [320, 480, 640, 960, 1280, 1600];
    const transformsBase = ["f_auto", "q_auto", "dpr_auto"];
    const src = cldTransform(url, [...transformsBase, "w_960"]);
    const srcSet = widths.map((w) => `${cldTransform(url, [...transformsBase, `w_${w}`])} ${w}w`).join(", ");
    const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw";
    return { src, srcSet, sizes };
  };

  // =========================================================
  // INFINITE SCROLL & NAVIGATION (Preserved)
  // =========================================================
  useEffect(() => {
    if (!loadMoreRef.current || !selectedEvent) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, photos.length));
          setLoadingMore(false);
        }, 100);
      }
    }, { rootMargin: "800px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [photos.length, loadingMore, selectedEvent]);

  const openLightbox = (photo, index) => { setSelectedPhoto(photo); setCurrentIndex(index); };
  const closeLightbox = () => { setSelectedPhoto(null); setIsNavigating(false); };

  const goToPrevious = useCallback(() => {
    if (isNavigating || photos.length === 0) return;
    setIsNavigating(true);
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? photos.length - 1 : prev - 1;
      setSelectedPhoto(photos[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsNavigating(false), 150);
  }, [isNavigating, photos]);

  const goToNext = useCallback(() => {
    if (isNavigating || photos.length === 0) return;
    setIsNavigating(true);
    setCurrentIndex((prev) => {
      const newIndex = prev === photos.length - 1 ? 0 : prev + 1;
      setSelectedPhoto(photos[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsNavigating(false), 150);
  }, [isNavigating, photos]);

  // Keyboard & Touch Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, goToPrevious, goToNext]);

  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e) => { startX = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      if (!startX || !selectedPhoto) return;
      if (Math.abs(startX - e.changedTouches[0].clientX) > 50)
        startX - e.changedTouches[0].clientX > 0 ? goToNext() : goToPrevious();
      startX = 0;
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [selectedPhoto, goToNext, goToPrevious]);

  const visiblePhotos = useMemo(() => photos.slice(0, visibleCount), [photos, visibleCount]);
  const breakpointColumnsObj = { default: 5, 1280: 4, 1024: 3, 640: 2, 0: 1 };

  // =========================================================
  // VIEW 1: EVENT DIRECTORY (Grid of Events)
  // =========================================================
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 md:p-12 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Event Memories</h1>
          <p className="text-gray-400 mb-12">Select an event to view its photo gallery.</p>

          {isLoadingEvents ? (
            <div className="text-indigo-400 animate-pulse">Loading events...</div>
          ) : eventsList.length === 0 ? (
            <div className="text-gray-500 text-center py-20 border border-gray-800 border-dashed rounded-xl">
              No events found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {eventsList.map((ev) => (
                <div
                  key={ev._id}
                  onClick={() => setSelectedEvent(ev)}
                  className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 cursor-pointer hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  <div className="h-48 bg-gray-800 relative overflow-hidden">
                    {ev.posterUrl ? (
                      <img
                        src={ev.posterUrl}
                        alt={ev.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <ImageIcon className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-400 transition">{ev.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">View Gallery &rarr;</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: PHOTO GALLERY (Masonry)
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      {/* Header Removed as requested - no back button, no title */}

      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="text-center py-32 border border-gray-800 border-dashed rounded-xl bg-gray-900/50">
          <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No photos uploaded yet.</p>
          <p className="text-gray-600 text-sm">Check back after the event!</p>
        </div>
      ) : (
        /* Masonry Grid */
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {visiblePhotos.map((photo, index) => {
            const { src, srcSet, sizes } = buildImageSources(photo.url);
            const tiny = placeholderUrl(photo.url);
            return (
              <div
                key={photo._id || `${photo.url}-${index}`}
                className="mb-4 overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => openLightbox(photo, index)}
              >
                <LazyImage
                  src={src}
                  srcSet={srcSet}
                  sizes={sizes}
                  placeholder={tiny}
                  alt={`gallery-${index}`}
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            );
          })}
        </Masonry>
      )}

      {/* Infinite Scroll Sentinel */}
      {visibleCount < photos.length && (
        <div ref={loadMoreRef} className="py-12 text-center text-sm text-gray-600 animate-pulse">
          {loadingMore ? "Loading more memories..." : "Scroll for more"}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4" onClick={closeLightbox}>
          {/* Close Button */}
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition z-30">
            <X size={32} />
          </button>

          {/* Navigation Buttons */}
          <button onClick={(e) => { e.stopPropagation(); goToPrevious(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition z-30">
            <ChevronLeft size={40} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition z-30">
            <ChevronRight size={40} />
          </button>

          {/* Main Image */}
          <div className="w-full h-full flex items-center justify-center pointer-events-none p-2 md:p-10">
            <img
              src={cldTransform(selectedPhoto.url, ["f_auto", "q_auto", "dpr_auto", "w_1600"])}
              srcSet={["640w", "960w", "1280w", "1600w"].map(w => `${cldTransform(selectedPhoto.url, ["f_auto", "q_auto", "dpr_auto", `w_${w.replace('w', '')}`])} ${w}`).join(", ")}
              sizes="90vw"
              alt="Memory"
              className="max-w-full max-h-full object-contain rounded shadow-2xl"
            />
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/80 text-sm bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
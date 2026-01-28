/**
 * AudioTimeline - Progress bar showing playback time
 *
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total duration in seconds
 * @param {boolean} isPlaying - Whether audio is currently playing
 */
export default function AudioTimeline({ currentTime = 0, duration = 90, isPlaying = false }) {
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-[var(--color-text-tertiary)] font-mono min-w-[40px]">
        {formatTime(currentTime)}
      </span>

      <div className="flex-1 bg-[var(--color-border)] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-purple-500 to-[var(--color-primary)] ${
            isPlaying ? 'transition-all duration-100 ease-linear' : 'transition-all duration-300'
          }`}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      <span className="text-xs text-[var(--color-text-tertiary)] font-mono min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}

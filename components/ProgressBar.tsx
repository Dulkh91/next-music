'use client'

type ProgressBarProp = {
    duration: number
    currentTime: number
    handleProgressChange: React.ChangeEventHandler<HTMLInputElement>
}

export default function ProgressBar({duration,currentTime, handleProgressChange}:ProgressBarProp){
    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return(
        <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="range range-secondary w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    )
}

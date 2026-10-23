
export default function Skeleton(){
    return(
        <div className=" bg-slate-800/40 rounded-lg shadow-md p-1.5 animate-pulse">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-300 rounded w-1/2"></div>
                </div>
            </div>
            <div className="mt-3 space-y-2">
                <div className="h-3 bg-slate-300 rounded w-full"></div>
                
            </div>
        </div>
    )
}
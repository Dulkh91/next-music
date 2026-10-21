
export default function GraphPlay(){
    return(
        <div className="flex items-end gap-0.5 h-4 ml-2">
            <span className="w-1 bg-purple-400 animate-bounce h-full rounded-full"></span>
            <span className="w-1 bg-purple-400 animate-bounce delay-100 h-2/3 rounded-full"></span>
            <span className="w-1 bg-purple-400 animate-bounce delay-200 h-4/5 rounded-full"></span>
        </div>
    )
}
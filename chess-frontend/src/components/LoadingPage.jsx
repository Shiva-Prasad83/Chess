export default function LoadingPage() {
    return (
        <div className="relative flex min-h-[75vh] items-center justify-center overflow-hidden">

            <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl animate-pulse" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                <span className="absolute left-6 top-10 text-8xl text-indigo-300/20 animate-bounce">
                    ♔
                </span>

                <span className="absolute right-10 top-24 text-7xl text-sky-300/20 animate-pulse">
                    ♞
                </span>

                <span className="absolute left-10 bottom-10 text-7xl text-indigo-200/20 animate-bounce delay-300">
                    ♜
                </span>

                <span className="absolute right-8 bottom-8 text-8xl text-sky-200/20 animate-pulse">
                    ♝
                </span>

                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] text-slate-200/10 animate-pulse">
                    ♛
                </span>

            </div>

            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/60 bg-white/75 p-10 shadow-2xl backdrop-blur-xl">

                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 shadow-[0_0_45px_rgba(99,102,241,0.45)]">

                    <span className="animate-pulse text-6xl text-white">
                        ♔
                    </span>

                </div>

                <h1 className="mt-8 text-center text-3xl font-bold text-slate-800">
                    Loading Learboard
                </h1>

                <p className="mt-3 text-center text-slate-500">
                    Please wait. Thank you for your patience!
                </p>

                <div className="mt-8 flex justify-center">

                    <div className="relative">

                        <div className="h-16 w-16 rounded-full border-4 border-indigo-100"></div>

                        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-blue-500"></div>

                    </div>

                </div>

                <div className="mt-10">

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                        <div className="loading-bar h-full rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400"></div>

                    </div>

                    <div className="mt-5 flex items-center justify-center gap-2">

                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"></span>

                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]"></span>

                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:300ms]"></span>

                    </div>

                    <p className="mt-5 text-center text-sm font-medium tracking-[0.3em] text-indigo-600">
                        LOADING...
                    </p>

                </div>

            </div>

            <style>{`
                .loading-bar{
                    width:40%;
                    animation:loading 1.8s ease-in-out infinite;
                }

                @keyframes loading{
                    0%{
                        transform:translateX(-120%);
                    }
                    50%{
                        transform:translateX(170%);
                    }
                    100%{
                        transform:translateX(320%);
                    }
                }
            `}</style>

        </div>
    );
}
/** Reusable skeleton primitives matching the tile/grid design system */

function Shimmer({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-[#f0f0ef] rounded ${className}`} />
    );
}

function TextLine({ width = 'w-full', height = 'h-3' }: { width?: string; height?: string }) {
    return <Shimmer className={`${width} ${height}`} />;
}

function Avatar({ size = 24 }: { size?: number }) {
    return <div className="animate-pulse bg-[#f0f0ef] rounded-sm" style={{ width: size, height: size }} />;
}

/** Single tile skeleton with configurable content lines */
function Tile({ span = 2, minH = '140px', lines = 3, dark = false }: {
    span?: 1 | 2 | 3 | 4;
    minH?: string;
    lines?: number;
    dark?: boolean;
}) {
    const colClass = span === 1 ? 'col-span-1' : span === 4 ? 'col-span-2 md:col-span-4' : 'col-span-2 md:col-span-2';
    const bg = dark ? 'bg-[#242423]' : 'bg-white';
    return (
        <div className={`${colClass} p-5 md:p-6 flex flex-col justify-between ${bg}`} style={{ minHeight: minH }}>
            <div className="flex items-center gap-3">
                <Shimmer className={`w-5 h-5 rounded-sm ${dark ? 'bg-[#3a3a39]' : ''}`} />
                <Shimmer className={`h-3.5 w-24 ${dark ? 'bg-[#3a3a39]' : ''}`} />
                <div className="flex-1" />
                <Shimmer className={`h-2 w-12 ${dark ? 'bg-[#3a3a39]' : ''}`} />
            </div>
            <div className="space-y-2 mt-auto">
                {Array.from({ length: lines }).map((_, i) => (
                    <Shimmer key={i} className={`h-2.5 ${i === 0 ? 'w-3/4' : i === 1 ? 'w-1/2' : 'w-1/3'} ${dark ? 'bg-[#3a3a39]' : ''}`} />
                ))}
            </div>
        </div>
    );
}

/** Header tile — dark artode square */
function ArtodeTile() {
    return (
        <div className="col-span-1 aspect-square bg-[#242423] flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-[#3a3a39] animate-pulse" />
        </div>
    );
}

/** Title tile — large header text skeleton */
function TitleTile({ span = 2 }: { span?: 2 | 3 }) {
    const colClass = span === 3 ? 'col-span-2 md:col-span-3' : 'col-span-2 md:col-span-2';
    return (
        <div className={`${colClass} p-6 md:p-8 bg-[#242423] flex flex-col justify-end min-h-[120px]`}>
            <Shimmer className="h-5 w-2/3 bg-[#3a3a39] mb-2" />
            <Shimmer className="h-2.5 w-1/3 bg-[#3a3a39]" />
        </div>
    );
}

/** Counter tile */
function CounterTile() {
    return (
        <div className="col-span-1 p-5 md:p-6 bg-white flex flex-col justify-between min-h-[120px]">
            <Shimmer className="h-2 w-10" />
            <Shimmer className="h-8 w-16" />
            <Shimmer className="h-2 w-14" />
        </div>
    );
}

/** Full-width filter bar skeleton */
function FilterBar() {
    return (
        <div className="col-span-2 md:col-span-4 p-4 md:p-5 bg-white flex items-center gap-3 min-h-[60px]">
            <Shimmer className="h-7 w-24 rounded-sm" />
            <Shimmer className="h-7 w-20 rounded-sm" />
            <div className="flex-1" />
            <Shimmer className="h-5 w-16 rounded-sm" />
            <Shimmer className="h-5 w-16 rounded-sm" />
        </div>
    );
}

/** Section header (light bg, label text) */
function SectionHeader({ width = 'w-32' }: { width?: string }) {
    return (
        <div className="col-span-2 md:col-span-4 px-5 py-3 bg-[#f7f6f3]">
            <Shimmer className={`h-2.5 ${width}`} />
        </div>
    );
}

/** Signature tile — divider + brand */
function SignatureTile() {
    return (
        <div className="col-span-2 md:col-span-2 p-5 md:p-6 bg-white flex flex-col justify-center min-h-[80px]">
            <div className="h-px bg-[#ededeb] mb-3" />
            <Shimmer className="h-2.5 w-24 mx-auto" />
        </div>
    );
}

/** Profile avatar tile — square image placeholder */
function AvatarTile() {
    return (
        <div className="col-span-1 aspect-square bg-[#f0f0ef] animate-pulse" />
    );
}

export const Skeleton = {
    Shimmer,
    TextLine,
    Avatar,
    Tile,
    ArtodeTile,
    TitleTile,
    CounterTile,
    FilterBar,
    SectionHeader,
    SignatureTile,
    AvatarTile,
};

/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import useScreenSize from "@hooks/useScreenSize";

export default function useModalResizer(size_type=null) {
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;
    const height = fullscreen ? "calc(100vh - 182px)" : "calc(100vh / 4 * 2 + 26px)";
    // switch (size_type) {
    //     case 'fullscreen': return {fullscreen: fullscreen, height: height};
    // }
    return {fullscreen: fullscreen, height: height};
}


import "./Tips.css";

import { Sparkles } from 'lucide-solid';

import {
    createEffect,
    createSignal,
    onCleanup,
} from "solid-js";

type TipsProps = {
    tips: string[];
    interval: number;
};

export default function Tips(props: TipsProps) {
    const [index, setIndex] = createSignal(0);

    let tipRef!: HTMLSpanElement;
    let sparklesRef!: HTMLSpanElement;
    let previous = -1;

    createEffect(() => {
        const count = props.tips.length;

        setIndex(0);

        if (count <= 1) return;

        const timer = setInterval(() => {
            setIndex((index) => (index + 1) % count);
        }, props.interval);

        onCleanup(() => clearInterval(timer));
    });

    createEffect(() => {
        const i = index();
        if (
            previous !== -1 &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            for (const el of [tipRef, sparklesRef]) {
                if (el) {
                    el.style.animation = "none";
                    void el.offsetHeight;
                    el.style.animation = "";
                }
            }
        }
        previous = i;
    });

    return (<div class="tips">
        <span ref={tipRef} class="tip-text">{props.tips[index()] ?? ""}</span>
        <span ref={sparklesRef} class="tips-sparkles">
            <Sparkles size={16} strokeWidth={1} />
        </span>
    </div >);
}

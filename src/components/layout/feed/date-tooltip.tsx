import { memo } from "react";
import { OutlineCalendar } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DateTooltipProps {
    dateLabel: string;
    fullDateString: string;
}

export const DateTooltip = memo(function DateTooltip({
    dateLabel,
    fullDateString
}: DateTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge className="pointer-events-auto bg-black/50 text-white text-xs">
                    <OutlineCalendar />
                    {dateLabel}
                </Badge>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                align="center"
            >
                {fullDateString}
            </TooltipContent>
        </Tooltip>
    );
});
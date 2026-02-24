import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X } from "lucide-react";

interface LicenseInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LicenseInfoModal({ open, onOpenChange }: LicenseInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Available licenses</DialogTitle>
          <p className="text-sm text-muted-foreground">
            The artist is the commissioned asset licensor and may include additional license terms in their Terms of Service or the service's description.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <Accordion type="single" collapsible className="w-full" defaultValue="personal">
            <AccordionItem value="personal" className="border-b-0 mb-4 rounded-xl bg-secondary/30 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-lg">Personal</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    For individual, non-commercial and non-monetized uses only
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Personal use (e.g. social media pfp, wallpaper, personal print)
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Monetized content (e.g. streaming, youtube videos)
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Commercial merchandising (e.g. t-shirts, stickers)
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="monetized" className="border-b-0 mb-4 rounded-xl bg-secondary/30 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-lg">Monetized content</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    For content creators and businesses who want to use the commissioned asset as part of creating and distributing commercial and monetized digital content
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Personal use
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Monetized content (streaming, videos, etc.)
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Commercial merchandising
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="commercial" className="border-b-0 rounded-xl bg-secondary/30 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-lg">Commercial merchandising</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    For businesses who want to create, promote, and re-sell their own digital or physical end products made with the commissioned asset
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="min-w-24 text-sm font-medium">Licensee</div>
                    <div className="text-sm text-muted-foreground">Individual or Legal Entity (Company)</div>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-start gap-3">
                    <div className="min-w-24 text-sm font-medium">Commercial use</div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">
                          Creation, re-selling, and distribution of value-add or derivative digital or physical end products made with the commissioned asset by the Licensee
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">
                          Creation and distribution of digital and physical content to promote the re-selling of value-add digital or physical end products created by the Licensee
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          Re-selling the commissioned asset "as-is" without any value-add activities
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-start gap-3">
                    <div className="min-w-24 text-sm font-medium">Credit the artist</div>
                    <div className="flex items-start gap-2 flex-1">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">
                        Required for all public uses unless agreed otherwise
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}

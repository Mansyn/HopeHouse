import {
    Directive,
    Input,
    EventEmitter,
    ElementRef,
    Renderer,
    OnInit
} from "@angular/core";

@Directive({
    selector: '[focus]'
})
export class FocusDirective {

    @Input('focus') focus: boolean;

    constructor(private elementRef: ElementRef,
        private renderer: Renderer) { }

    ngOnChanges() {
        if (this.focus) {
            this.renderer
                .invokeElementMethod(this.elementRef.nativeElement, 'focus', []);
        };
    }
}
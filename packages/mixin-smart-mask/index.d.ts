declare namespace GlobalMixin {
    interface DisplayObject {
        smartMask: any;
        updateSmartMask(recursive?: boolean, skipUpdate?: boolean): void;
    }
}

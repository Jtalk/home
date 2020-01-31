
export class UseStateMock {

    constructor() {
        this.index = -1;
        this.values = [];
    }

    useState = (init) => {
        if (this.values.length <= this.index) {
            // First render, initialise
            this.values.push(init);
        }
        let currentIndex = this.index;
        return [this.values[this.index++], v => this.setState(currentIndex, v)];
    };

    setState = (idx, value) => {
        this.values[idx] = value;
        this.rerender();
    };

    rerender = () => {
        this.index = 0;
    };
}
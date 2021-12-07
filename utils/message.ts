import { State } from "./state.enum";

export class Message {
    public text: Readonly<string>;
    public state: State;

    constructor(text:  NonNullable<string>, state: NonNullable<State>) {
        this.text = text;
        this.state = state;
    }
}
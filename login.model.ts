import { BaseModel, Field, Validation } from "./utils/base.model";
import { State } from "./utils/state.enum";
import { maxLength, required } from "./utils/validations";

//Sample of a model using the Field utility
export class LoginModel extends BaseModel {
    //All properties should be fields to validate and offer logical structures
    //for both logical processes as well as visual components alike, all in one place
    public username: Readonly<Field<LoginModel, string>>;
    public password: Readonly<Field<LoginModel, string>>;

    constructor(data: any = null) {
        super();

        //Deep copying so all data is always unreferenced from its source
        data = data ? JSON.parse(JSON.stringify(data)) : {};
        
        const username: string = data.username || null;
        this.username = new Field(username, [required('Username'), maxLength(50, 'Username')]);

        const password: string = data.password || null;
        this.password = new Field(password, [required('Password'), maxLength(50, 'Username'), userAndPasswordNotEqual()]);
    }
}

//Create your custom validations
function userAndPasswordNotEqual(): Validation<LoginModel, string> {
    return new Validation((model, value) => value != model.username.value, 'Username and password cannot be equal', State.Warning);
}
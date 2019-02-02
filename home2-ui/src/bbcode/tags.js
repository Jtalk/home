import React from "react";
import parser, {Tag} from "bbcode-to-react";

class PTag extends Tag {
    toReact() {
        return <p>{this.getComponents()}</p>
    }
}

class AbbrTag extends Tag {
    toReact() {
        return <abbr title={this.params.title}>{this.getComponents()}</abbr>
    }
}

class H1Tag extends Tag {
    toReact() {
        return <h1>{this.getComponents()}</h1>
    }
}

class H2Tag extends Tag {
    toReact() {
        return <h2>{this.getComponents()}</h2>
    }
}

class H3Tag extends Tag {
    toReact() {
        return <h3>{this.getComponents()}</h3>
    }
}

class H4Tag extends Tag {
    toReact() {
        return <h4>{this.getComponents()}</h4>
    }
}

class H5Tag extends Tag {
    toReact() {
        return <h5>{this.getComponents()}</h5>
    }
}

parser.registerTag('p', PTag);
parser.registerTag('abbr', AbbrTag);
parser.registerTag('h1', H1Tag);
parser.registerTag('h2', H2Tag);
parser.registerTag('h3', H3Tag);
parser.registerTag('h4', H4Tag);
parser.registerTag('h5', H5Tag);
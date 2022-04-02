import {parser} from "lezer-python";
import {TreeCursor} from "lezer-tree";
import {BinOp, Expr, Stmt} from "./ast";

export function traverseArgs(c : TreeCursor, s : string) : Array<Expr> {
  var args : Array<Expr> = []
  c.firstChild(); // go into arglist
  while(c.nextSibling()){
    args.push(traverseExpr(c,s))
    c.nextSibling();
  }
  c.parent(); // pop arglist
  return args;
}

export function traverseExpr(c : TreeCursor, s : string) : Expr {
  switch(c.type.name) {
    case "Number":
      return {
        tag: "num",
        value: Number(s.substring(c.from, c.to))
      }
    case "VariableName":
      return {
        tag: "id",
        name: s.substring(c.from, c.to)
      }
    case "CallExpression":
      c.firstChild();
      const callName = s.substring(c.from, c.to);
      c.nextSibling(); // go to arglist
      var args = traverseArgs(c , s);
      if (args.length == 1){
        if (callName !== "abs" && callName !== "print")
          throw new Error("ParseError: unknown builtin1");
        c.parent(); // pop CallExpression
        return {
          tag: "builtin1",
          name: callName,
          arg: args[0]
        };
      } else if (args.length == 2) {
          if (callName !== "min" && callName !== "max" && callName !== "pow")
            throw new Error("ParseError: unknown builtin2");
          c.parent(); // pop CallExpression
          return {
            tag: "builtin2",
            name: callName,
            arg1: args[0],
            arg2: args[1]
          };
      }
      throw new Error("ParseError: can't make function calls with 0 or more than 2 arguements")
      case "UnaryExpression":
        c.firstChild();
        const ope1 = s.substring(c.from, c.to);
        if (ope1 !=="-" && ope1 !== "+")
          throw new Error("ParseError: unsupported unary operator");
        c.nextSibling();
        var num = Number(ope1 + s.substring(c.from,c.to));
        if (isNaN(num))
          throw new Error("ParseError: unary operation failed");
        c.parent();
        return {
          tag: "num",
          value: num
        };
      case "BinaryExpression":
        c.firstChild();
        const left = traverseExpr(c,s);
        c.nextSibling();
        var ope : BinOp;
        switch(s.substring(c.from,c.to)){
          case "+":
            ope = BinOp.Plus;
            break;
          case "-":
            ope = BinOp.Minus;
            break;
          case "*":
            ope = BinOp.Mul;
            break;
          default:
            throw new Error("ParseError: unknown binary operation");
        }
        c.nextSibling();
        const right = traverseExpr(c,s);
        c.parent();
        return {
          tag: "binexpr",
          op: ope,
          left: left,
          right: right
        };

    default:
      throw new Error("ParseError Could not parse expr at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverseStmt(c : TreeCursor, s : string) : Stmt {
  switch(c.node.type.name) {
    case "AssignStatement":
      c.firstChild(); // go to name
      const name = s.substring(c.from, c.to);
      c.nextSibling(); // go to equals
      c.nextSibling(); // go to value
      const value = traverseExpr(c, s);
      c.parent();
      return {
        tag: "define",
        name: name,
        value: value
      }
    case "ExpressionStatement":
      c.firstChild();
      const expr = traverseExpr(c, s);
      c.parent(); // pop going into stmt
      return { tag: "expr", expr: expr }
    default:
      throw new Error("ParseError Could not parse stmt at " + c.node.from + " " + c.node.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverse(c : TreeCursor, s : string) : Array<Stmt> {
  switch(c.node.type.name) {
    case "Script":
      const stmts = [];
      c.firstChild();
      do {
        stmts.push(traverseStmt(c, s));
      } while(c.nextSibling())
    //  console.log("traversed " + stmts.length + " statements ", stmts, "stopped at " , c.node);
      return stmts;
    default:
      throw new Error("ParseError Could not parse program at " + c.node.from + " " + c.node.to);
  }
}
export function parse(source : string) : Array<Stmt> {
  const t = parser.parse(source);
  return traverse(t.cursor(), source);
}

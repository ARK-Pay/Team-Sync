export function getSectionForNode(n) {
  switch (n.type) {
    case "ModuleImport":
      return "import";

    case "CallInstruction":
    case "CallIndirectInstruction":
    case "Func":
    case "Instr":
      return "code";

    case "ModuleExport":
      return "export";

    case "Start":
      return "start";

    case "TypeInstruction":
      return "type";

    case "IndexInFuncSection":
      return "func";

    case "Global":
      return "global";
    // No section

    default:
      return;
  }
}ion":
      return "func";

    case "Global":
      return "global";
    // No section

    default:
      return;
  }
}
/**
 * Mermaid Generator for GeraSoft
 * Converts visual diagram JSON data into Mermaid.js compatible code.
 */

export const generateMermaid = (diagram) => {
  const { tipo, contenido } = diagram;
  if (!contenido) return "";

  switch (tipo) {
    case "usecase":
      return generateUseCase(contenido);
    case "class":
      return generateClass(contenido);
    case "sequence":
      return generateSequence(contenido);
    case "package":
      return generatePackage(contenido);
    default:
      return "";
  }
};

const generateUseCase = (data) => {
  let lines = ["usecaseDiagram"];
  
  // System Boundary
  const sb = data.systemBoundary || {};
  if (sb.width && sb.height) {
    // Mermaid doesn't strictly support system boundary coordinates, but we can group
    // In Mermaid it's 'package SystemName { ... }' or 'rect SystemName { ... }'
    lines.push("  rect \"Sistema\"");
  }

  // Actors
  (data.actors || []).forEach(a => {
    lines.push(`  actor "${a.name}"`);
  });

  // Use Cases
  (data.useCases || []).forEach(u => {
    lines.push(`  usecase "${u.name}"`);
  });

  // Associations
  (data.associations || []).forEach(assoc => {
    const from = data.actors.find(a => a.id === assoc.from) || data.useCases.find(u => u.id === assoc.from);
    const to = data.actors.find(a => a.id === assoc.to) || data.useCases.find(u => u.id === assoc.to);
    if (from && to) {
      lines.push(`  "${from.name}" -- "${to.name}"`);
    }
  });

  return lines.join("\n");
};

const generateClass = (data) => {
  let lines = ["classDiagram"];
  
  (data.classes || []).forEach(c => {
    lines.push(`  class ${c.name.replace(/\s+/g, "")} {`);
    (c.attributes || []).forEach(attr => lines.push(`    +${attr.type} ${attr.name}`));
    (c.methods || []).forEach(m => lines.push(`    +${m.name}()`));
    lines.push("  }");
  });

  (data.relationships || []).forEach(rel => {
    const from = data.classes.find(c => c.id === rel.from);
    const to = data.classes.find(c => c.id === rel.to);
    if (from && to) {
      let arrow = "--";
      if (rel.relType === "inheritance") arrow = "<|--";
      if (rel.relType === "composition") arrow = "*--";
      if (rel.relType === "aggregation") arrow = "o--";
      lines.push(`  ${from.name.replace(/\s+/g, "")} ${arrow} ${to.name.replace(/\s+/g, "")} : ${rel.label || ""}`);
    }
  });

  return lines.join("\n");
};

const generateSequence = (data) => {
  let lines = ["sequenceDiagram"];
  
  (data.actors || []).forEach(a => {
    lines.push(`  participant ${a.name.replace(/\s+/g, "")} as ${a.name}`);
  });

  (data.messages || []).forEach(m => {
    const from = data.actors.find(a => a.id === m.from);
    const to = data.actors.find(a => a.id === m.to);
    if (from && to) {
      let arrow = "->>";
      if (m.type === "async") arrow = "->>";
      if (m.type === "return") arrow = "-->>";
      lines.push(`  ${from.name.replace(/\s+/g, "")}${arrow}${to.name.replace(/\s+/g, "")}: ${m.label}`);
    }
  });

  return lines.join("\n");
};

const generatePackage = (data) => {
  let lines = ["graph TD"]; // Package diagrams often map to flowcharts in simple Mermaid
  
  (data.packages || []).forEach(p => {
    lines.push(`  subgraph ${p.name.replace(/\s+/g, "")} ["${p.name}"]`);
    // Assuming internal components or just representing dependencies
    lines.push("  end");
  });

  (data.dependencies || []).forEach(dep => {
    const from = data.packages.find(p => p.id === dep.from);
    const to = data.packages.find(p => p.id === dep.to);
    if (from && to) {
      lines.push(`  ${from.name.replace(/\s+/g, "")} -.-> ${to.name.replace(/\s+/g, "")}`);
    }
  });

  return lines.join("\n");
};

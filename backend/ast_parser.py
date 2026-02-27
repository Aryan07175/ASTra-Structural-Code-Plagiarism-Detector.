import ast

def parse_and_flatten(code: str):
    """
    Parses Python code into an AST and yields a flat sequence of dictionaries
    containing the node type and its original line number.
    Uses Depth-First Search (DFS) for structural linearisation.
    """
    try:
        tree = ast.parse(code)
    except Exception:
        # If parsing fails (e.g., syntax error), return empty sequence
        return []
    
    flat_nodes = []
    
    class Visitor(ast.NodeVisitor):
        def generic_visit(self, node):
            node_type = type(node).__name__
            lineno = getattr(node, 'lineno', -1)
            
            # Ignore context nodes that don't add structural value
            if node_type not in ('Load', 'Store', 'Del', 'Module'):
                flat_nodes.append({
                    'type': node_type,
                    'lineno': lineno
                })
                
            super().generic_visit(node)
            
    Visitor().visit(tree)
    return flat_nodes

if __name__ == "__main__":
    test_code = '''
def hello_world(name_val):
    if name_val:
        print("Hello " + name_val)
    return 1
'''
    print(parse_and_flatten(test_code))

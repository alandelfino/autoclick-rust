import sys
import json
import os

def error_response(msg):
    print(json.dumps({"status": "error", "message": msg}))
    sys.exit(0)

def success_response(data):
    print(json.dumps({"status": "success", **data}))
    sys.exit(0)

def test_sqlite(config):
    db_path = config.get("path")
    if not db_path:
        error_response("Caminho do arquivo SQLite não informado.")
    
    # Check if directory exists
    dir_name = os.path.dirname(db_path)
    if dir_name and not os.path.exists(dir_name):
        error_response(f"Diretório '{dir_name}' não existe.")

    import sqlite3
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Extract schema
        # List tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema = {}
        for table in tables:
            cursor.execute(f"PRAGMA table_info([{table}]);")
            # columns: (cid, name, type, notnull, dflt_value, pk)
            columns = [row[1] for row in cursor.fetchall()]
            schema[table] = columns
            
        conn.close()
        success_response({
            "message": f"Conectado! {len(tables)} tabelas encontradas no SQLite.",
            "schema": schema
        })
    except Exception as e:
        error_response(str(e))

def query_sqlite(config, sql):
    db_path = config.get("path")
    if not db_path:
        error_response("Caminho do arquivo SQLite não informado.")
        
    import sqlite3
    try:
        conn = sqlite3.connect(db_path)
        # return dictionaries
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql)
        
        if cursor.description:
            rows = [dict(row) for row in cursor.fetchall()]
            rows_affected = len(rows)
        else:
            conn.commit()
            rows = []
            rows_affected = cursor.rowcount
            
        conn.close()
        success_response({
            "rows": rows,
            "rows_affected": rows_affected
        })
    except Exception as e:
        error_response(str(e))

def test_postgres(config):
    try:
        import psycopg2
    except ImportError:
        error_response("Driver PostgreSQL não instalado. Execute: pip install psycopg2-binary")
        
    host = config.get("host", "localhost")
    port = config.get("port", 5432)
    database = config.get("database", "")
    user = config.get("user", "")
    password = config.get("password", "")
    
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password,
            connect_timeout=5
        )
        cursor = conn.cursor()
        
        # Get tables and columns
        cursor.execute("""
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position;
        """)
        rows = cursor.fetchall()
        
        schema = {}
        for table_name, column_name in rows:
            if table_name not in schema:
                schema[table_name] = []
            schema[table_name].append(column_name)
            
        cursor.close()
        conn.close()
        
        success_response({
            "message": f"Conectado! {len(schema)} tabelas encontradas no PostgreSQL.",
            "schema": schema
        })
    except Exception as e:
        error_response(str(e))

def query_postgres(config, sql):
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
    except ImportError:
        error_response("Driver PostgreSQL não instalado. Execute: pip install psycopg2-binary")
        
    host = config.get("host", "localhost")
    port = config.get("port", 5432)
    database = config.get("database", "")
    user = config.get("user", "")
    password = config.get("password", "")
    
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(sql)
        
        rows = []
        rows_affected = 0
        if cursor.description:
            rows = [dict(row) for row in cursor.fetchall()]
            rows_affected = len(rows)
        else:
            conn.commit()
            rows_affected = cursor.rowcount
            
        cursor.close()
        conn.close()
        success_response({
            "rows": rows,
            "rows_affected": rows_affected
        })
    except Exception as e:
        error_response(str(e))

def test_mysql(config):
    try:
        import pymysql
    except ImportError:
        error_response("Driver MySQL não instalado. Execute: pip install pymysql")
        
    host = config.get("host", "localhost")
    port = int(config.get("port", 3306))
    database = config.get("database", "")
    user = config.get("user", "")
    password = config.get("password", "")
    
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password,
            connect_timeout=5
        )
        cursor = conn.cursor()
        
        # Get tables and columns
        cursor.execute(f"""
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = '{database}' 
            ORDER BY table_name, ordinal_position;
        """)
        rows = cursor.fetchall()
        
        schema = {}
        for table_name, column_name in rows:
            if table_name not in schema:
                schema[table_name] = []
            schema[table_name].append(column_name)
            
        cursor.close()
        conn.close()
        
        success_response({
            "message": f"Conectado! {len(schema)} tabelas encontradas no MySQL.",
            "schema": schema
        })
    except Exception as e:
        error_response(str(e))

def query_mysql(config, sql):
    try:
        import pymysql
        from pymysql.cursors import DictCursor
    except ImportError:
        error_response("Driver MySQL não instalado. Execute: pip install pymysql")
        
    host = config.get("host", "localhost")
    port = int(config.get("port", 3306))
    database = config.get("database", "")
    user = config.get("user", "")
    password = config.get("password", "")
    
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password,
            cursorclass=DictCursor
        )
        cursor = conn.cursor()
        cursor.execute(sql)
        
        rows = []
        rows_affected = 0
        if cursor.description:
            rows = [dict(row) for row in cursor.fetchall()]
            rows_affected = len(rows)
        else:
            conn.commit()
            rows_affected = cursor.rowcount
            
        cursor.close()
        conn.close()
        success_response({
            "rows": rows,
            "rows_affected": rows_affected
        })
    except Exception as e:
        error_response(str(e))

def main():
    if len(sys.argv) < 4:
        error_response("Parâmetros insuficientes.")
        
    action = sys.argv[1] # "test" or "query"
    db_type = sys.argv[2] # "sqlite", "postgres", "mysql"
    config_str = sys.argv[3]
    
    try:
        config = json.loads(config_str)
    except Exception as e:
        error_response(f"Configuração JSON inválida: {e}")
        
    if action == "test":
        if db_type == "sqlite":
            test_sqlite(config)
        elif db_type == "postgres":
            test_postgres(config)
        elif db_type == "mysql":
            test_mysql(config)
        else:
            error_response(f"Tipo de banco não suportado: {db_type}")
    elif action == "query":
        if len(sys.argv) < 5:
            error_response("Query SQL não informada.")
        sql = sys.argv[4]
        if db_type == "sqlite":
            query_sqlite(config, sql)
        elif db_type == "postgres":
            query_postgres(config, sql)
        elif db_type == "mysql":
            query_mysql(config, sql)
        else:
            error_response(f"Tipo de banco não suportado: {db_type}")
    else:
        error_response(f"Ação desconhecida: {action}")

if __name__ == "__main__":
    main()

import sys
import json
import sqlite3

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"status": "error", "message": "Argumentos insuficientes. Uso: db_helper.py <action> <db_type> <config_json> [<query>]"}))
        sys.exit(1)
        
    action = sys.argv[1]
    db_type = sys.argv[2].lower()
    config_json = sys.argv[3]
    query = sys.argv[4] if len(sys.argv) > 4 else None
    
    try:
        config = json.loads(config_json)
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"Erro ao decodificar JSON de config: {str(e)}"}))
        sys.exit(1)
        
    if db_type == "sqlite":
        handle_sqlite(action, config, query)
    elif db_type == "postgre":
        handle_postgresql(action, config, query)
    elif db_type == "mysql":
        handle_mysql(action, config, query)
    else:
        print(json.dumps({"status": "error", "message": f"Tipo de banco não suportado: {db_type}"}))
        sys.exit(1)

def handle_sqlite(action, config, query):
    db_path = config.get("value1") or config.get("path")
    if not db_path:
        print(json.dumps({"status": "error", "message": "Caminho do banco SQLite não fornecido."}))
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        if action == "schema":
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            result_tables = []
            for t in tables:
                cursor.execute(f"PRAGMA table_info({t});")
                cols = cursor.fetchall()
                # cols: (cid, name, type, notnull, dflt_value, pk)
                columns = [{"name": c[1], "type": c[2]} for c in cols]
                result_tables.append({"name": t, "columns": columns})
            print(json.dumps({"status": "success", "tables": result_tables}))
            
        elif action in ("query", "execute"):
            if not query:
                print(json.dumps({"status": "error", "message": "Nenhuma query fornecida."}))
                return
            cursor.execute(query)
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                records = [dict(zip(columns, row)) for row in rows]
                print(json.dumps({"status": "success", "records": records}))
            else:
                conn.commit()
                print(json.dumps({"status": "success", "affected_rows": cursor.rowcount}))
        else:
            print(json.dumps({"status": "error", "message": f"Ação desconhecida: {action}"}))
            
        conn.close()
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

def handle_postgresql(action, config, query):
    try:
        import psycopg2
    except ImportError:
        try:
            import pg8000 as psycopg2
        except ImportError:
            print(json.dumps({"status": "error", "message": "Por favor, instale psycopg2 ou pg8000 para PostgreSQL: pip install psycopg2-binary"}))
            return

    conn_str = config.get("value1", "")
    user = config.get("value2", "")
    password = config.get("value3", "")
    
    try:
        if conn_str.startswith("postgresql://") or conn_str.startswith("postgres://"):
            conn = psycopg2.connect(conn_str)
        else:
            host = conn_str
            port = 5432
            dbname = "postgres"
            
            if "/" in host:
                host, dbname = host.split("/", 1)
            if ":" in host:
                host, port_str = host.split(":", 1)
                try:
                    port = int(port_str)
                except:
                    pass
            
            conn = psycopg2.connect(host=host, port=port, database=dbname, user=user, password=password)
            
        cursor = conn.cursor()
        
        if action == "schema":
            cursor.execute("""
                SELECT table_name, column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public'
                ORDER BY table_name, ordinal_position;
            """)
            rows = cursor.fetchall()
            
            tables_map = {}
            for row in rows:
                t_name, col_name, col_type = row
                if t_name not in tables_map:
                    tables_map[t_name] = []
                tables_map[t_name].append({"name": col_name, "type": col_type})
                
            result_tables = [{"name": name, "columns": cols} for name, cols in tables_map.items()]
            print(json.dumps({"status": "success", "tables": result_tables}))
            
        elif action in ("query", "execute"):
            if not query:
                print(json.dumps({"status": "error", "message": "Nenhuma query fornecida."}))
                return
            cursor.execute(query)
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                records = [dict(zip(columns, row)) for row in rows]
                print(json.dumps({"status": "success", "records": records}))
            else:
                conn.commit()
                print(json.dumps({"status": "success", "affected_rows": cursor.rowcount}))
        else:
            print(json.dumps({"status": "error", "message": f"Ação desconhecida: {action}"}))
            
        conn.close()
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

def handle_mysql(action, config, query):
    try:
        import pymysql
    except ImportError:
        try:
            import mysql.connector as pymysql
        except ImportError:
            print(json.dumps({"status": "error", "message": "Por favor, instale pymysql ou mysql-connector-python: pip install pymysql"}))
            return
            
    conn_str = config.get("value1", "")
    user = config.get("value2", "")
    password = config.get("value3", "")
    
    try:
        host = conn_str
        port = 3306
        dbname = ""
        
        if conn_str.startswith("mysql://"):
            url = conn_str[8:]
            if "@" in url:
                auth, server = url.split("@", 1)
                if ":" in auth:
                    user, password = auth.split(":", 1)
                else:
                    user = auth
            else:
                server = url
                
            if "/" in server:
                server, dbname = server.split("/", 1)
            if ":" in server:
                host, port_str = server.split(":", 1)
                try:
                    port = int(port_str)
                except:
                    pass
            else:
                host = server
        else:
            if "/" in host:
                host, dbname = host.split("/", 1)
            if ":" in host:
                host, port_str = host.split(":", 1)
                try:
                    port = int(port_str)
                except:
                    pass
                    
        conn = pymysql.connect(
            host=host, 
            port=port, 
            user=user, 
            password=password, 
            database=dbname if dbname else None,
            connect_timeout=5
        )
        cursor = conn.cursor()
        
        if action == "schema":
            cursor.execute("SELECT DATABASE();")
            current_db = cursor.fetchone()[0]
            if not current_db:
                print(json.dumps({"status": "error", "message": "Banco de dados não selecionado na conexão MySQL."}))
                return
                
            cursor.execute(f"""
                SELECT table_name, column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = '{current_db}'
                ORDER BY table_name, ordinal_position;
            """)
            rows = cursor.fetchall()
            
            tables_map = {}
            for row in rows:
                t_name, col_name, col_type = row
                if t_name not in tables_map:
                    tables_map[t_name] = []
                tables_map[t_name].append({"name": col_name, "type": col_type})
                
            result_tables = [{"name": name, "columns": cols} for name, cols in tables_map.items()]
            print(json.dumps({"status": "success", "tables": result_tables}))
            
        elif action in ("query", "execute"):
            if not query:
                print(json.dumps({"status": "error", "message": "Nenhuma query fornecida."}))
                return
            cursor.execute(query)
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                records = [dict(zip(columns, row)) for row in rows]
                print(json.dumps({"status": "success", "records": records}))
            else:
                conn.commit()
                print(json.dumps({"status": "success", "affected_rows": cursor.rowcount}))
        else:
            print(json.dumps({"status": "error", "message": f"Ação desconhecida: {action}"}))
            
        conn.close()
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    main()

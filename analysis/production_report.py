#%%
import psycopg2
from dotenv import load_dotenv
import os
from sshtunnel import SSHTunnelForwarder
from psycopg2.extras import DictCursor
import pandas as pd

load_dotenv(r'.\dados.env',override=True)

def get_connection_using_ssh_tunnel():
    with SSHTunnelForwarder(
        (os.getenv('SSH_HOST'), int(os.getenv('SSH_PORT'))),
        ssh_username=os.getenv('SSH_USER'),
        ssh_password=os.getenv('SSH_PASSWORD'),
        remote_bind_address=(os.getenv('DB_HOST'), int(os.getenv('DB_PORT'))),
        local_bind_address=('localhost', 5441)
    ) as server:

        server.start()

        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=server.local_bind_host,
            port=server.local_bind_port,
            sslmode='disable'
        )

        return conn

def get_connect_using_psycopg2():



    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        sslmode='disable'
    )

    return conn

def execute_query(query):
    print('obtendo conexao')
    conn = get_connect_using_psycopg2()
    print('obtendo cursor')
    cursor = conn.cursor(cursor_factory=DictCursor)
    print('executando query')
    cursor.execute(query)
    print('obtendo dados')
    data = cursor.fetchall()
    print('fechando cursor')
    conn.close()

    results_as_dict = [dict(result) for result in data]

    return results_as_dict



def main(nome_do_feather = None):

    def carregar_do_feather():
        df = pd.read_feather(nome_do_feather)
        return df

    def carregar_do_banco():
      sql = """
          select  u.nome as funcionario, r.data , c.titulo as cargo , a.descricao as atividade , f.nome as furo , ar.quantidade , acv.valor_unitario
          from atividade_rdos ar
          inner join rdo_users ru on ru.rdo_id  = ar.rdo_id
          inner join rdos r on r.id = ar.rdo_id
          inner join atividades a on a.id = ar.atividade_id
          inner join furos f on f.id = ar.furo_id
          inner join users u on ru.user_id  = u.id
          inner join cargos c on c.id = u.cargo_id
          inner join atividade_cargo_valores acv on acv.cargo_id  = u.cargo_id and acv.atividade_id = ar.atividade_id
          where r."data" between '{inicio}' and '{fim}'
          and a.tipo  = 'produtiva'
          and r.contrato_id = {contrato}
          and f.invalid is false
          order by u.nome , r."data" , a.descricao , f.nome
      """.format(
          inicio='2023-12-21',
          fim='2024-01-20',
          contrato=1
      )

      data = execute_query(sql)

      df = pd.DataFrame(data)

      return df

    df = carregar_do_banco() if nome_do_feather is None else carregar_do_feather()

    return df

df = main(nome_do_feather='contrato-1-2023-12-21-2024-01-20.feather')
# df = main()

df
# %%

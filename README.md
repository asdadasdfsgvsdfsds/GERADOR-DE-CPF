import tkinter as tk
import random

def gerar_numero_aleatorio():
    # Gera um número aleatório de 10 dígitos (iniciando com zero)
    numero = '0' + ''.join(str(random.randint(0, 9)) for _ in range(10))
    
    # Formata o número adicionando um ponto a cada três dígitos
    numero_formatado = '.'.join(numero[i:i+3] for i in range(0, 11, 3))
    
    return numero_formatado

# Função chamada ao clicar no Botão 3
def evento_botao3():
    novo_numero = gerar_numero_aleatorio()  # Chama a função para gerar um número aleatório
    label.config(text=novo_numero)  # Atualiza o texto da label com o número gerado

# Criação da janela principal
root = tk.Tk()
root.title("Interface Exemplo")
root.geometry("400x110")  # Tamanho da janela (largura x altura)
root.resizable(False, False)

# Caixa de texto (ou label)
label = tk.Label(root, text="GERADOR DE CPF", font=("Arial", 20))
label.pack(pady=20)  # Usando pack para centralizar verticalmente com espaçamento

# Botão
btn3 = tk.Button(root, text="GERAR", command=evento_botao3)
btn3.pack()  # Usando pack para centralizar

# Executa a interface
root.mainloop()



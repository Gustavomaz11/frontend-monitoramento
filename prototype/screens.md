# Protótipo das Telas

## Painel do responsável

### 1. Login

- E-mail.
- Senha.
- Entrar.
- Link para cadastro.
- Link de recuperação de senha.
- Aviso curto: "Use apenas para dispositivos sob sua responsabilidade legal."

### 2. Cadastro do responsável

- Nome.
- E-mail.
- Senha.
- Aceite de termos e política de privacidade.
- Confirmação de e-mail.

### 3. Vinculação de dispositivo

- Botão "Gerar QR Code".
- Código temporário com expiração.
- Instruções para abrir o app no celular da criança.
- Status: aguardando, vinculado, expirado.
- Lista de dispositivos vinculados.

### 4. Dashboard

Cards principais:

- Tempo total de tela hoje.
- Aplicativos mais utilizados.
- Domínios mais acessados.
- Categorias mais acessadas.
- Tentativas bloqueadas.
- Comparação com os sete dias anteriores.
- Status do celular.
- Última sincronização.

Gráficos:

- Linha de tempo dos últimos 7 dias.
- Barras por aplicativo.
- Barras por categoria.
- Lista de alertas recentes.

Estados:

- Sem dados ainda.
- Dispositivo sem sincronizar.
- Permissões Android pendentes.
- VPN desativada.

### 5. Uso de aplicativos

- Filtro por criança, dispositivo e período.
- Tabela: app, package name, tempo, primeiro uso, último uso, aberturas estimadas.
- Gráfico diário por app.
- Indicação de dados aproximados quando aplicável.

### 6. Histórico de domínios

- Filtro por período, categoria, status e domínio.
- Tabela: domínio, IP, protocolo, porta, primeiro acesso, último acesso, quantidade, categoria, correlação com app.
- Badge para `estimado`, `observado` ou `sem correlação`.
- Mensagem fixa: "Domínios podem não aparecer quando o Android/app usa DNS privado, DoH, QUIC ou VPN de terceiros."

### 7. Categorias acessadas

- Distribuição por categoria.
- Lista de domínios por categoria.
- Destaque para adulto, apostas, violência, malicioso e desconhecidos.
- Ação rápida para criar regra.

### 8. Alertas

- Filtros por severidade, tipo, criança, dispositivo e status.
- Timeline de alertas.
- Ações: marcar como lido, resolver, criar regra, permitir domínio.
- Detalhe sem expor conteúdo de pacote ou URL completa.

### 9. Sites bloqueados e permitidos

- Lista de regras por domínio.
- Lista de categorias bloqueadas.
- Lista de domínios sempre permitidos.
- Prioridade visual de regras.
- Histórico de alterações auditadas.

### 10. Configuração de horários

- Grade semanal.
- Períodos permitidos por dia.
- Exceções.
- Modo férias.
- Prévia das regras ativas para cada dispositivo.

### 11. Relatório diário e semanal

- Resumo de tempo de tela.
- Top aplicativos.
- Top domínios.
- Categorias.
- Tentativas bloqueadas.
- Alertas.
- Exportar CSV/PDF em fase futura.

### 12. Configurações de privacidade

- Retenção dos dados.
- Exportação.
- Exclusão total.
- Revogar dispositivo.
- Texto de transparência mostrado à criança.
- Baixar política de privacidade.

## App Android da criança

### 1. Primeira execução

- Explicação: proteção parental ativa.
- Dados coletados e não coletados.
- Quem visualiza.
- Retenção.
- Como desativar e excluir dados com o responsável.
- Botões para continuar e abrir permissões necessárias.

### 2. Status da proteção

- VPN: ativa/inativa.
- Acesso de uso: concedido/pendente.
- Última sincronização.
- Dados locais recentes.
- Link para política de privacidade.

### 3. Uso local

- Tempo de tela hoje.
- Apps mais usados hoje.
- Avisos de regras familiares ativas.

### 4. Página local de bloqueio

- Título: "Acesso bloqueado por uma regra familiar".
- Motivo: domínio, categoria ou horário.
- Botão para pedir desbloqueio.
- Estado de pedido: enviado, aprovado, negado.

### 5. Pedido de desbloqueio

- Domínio/categoria.
- Mensagem opcional da criança.
- Enviar ao responsável.


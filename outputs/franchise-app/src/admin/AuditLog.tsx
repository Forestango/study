import { List } from "@refinedev/antd";
import { Card, Table } from "antd";
import { useEffect, useState } from "react";
import { getAuditEventsAsync } from "../data/storage";
import type { AuditEvent } from "../shared/types";

export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    getAuditEventsAsync().then(setEvents);
  }, []);

  return (
    <List title="Последние действия">
      <Card>
        <Table dataSource={events} rowKey="id" pagination={{ pageSize: 30 }}>
          <Table.Column<AuditEvent> title="Дата" dataIndex="createdAt" width={180} />
          <Table.Column<AuditEvent> title="Действие" dataIndex="action" width={240} />
          <Table.Column<AuditEvent> title="Детали" dataIndex="detail" />
          <Table.Column<AuditEvent> title="Автор" dataIndex="actor" width={140} />
        </Table>
      </Card>
    </List>
  );
}

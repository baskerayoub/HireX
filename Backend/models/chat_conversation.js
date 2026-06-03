module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "chat_conversation",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      fk_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "New conversation",
      },
      messages: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: "[]",
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "chat_conversations",
      timestamps: true,
      indexes: [
        {
          name: "chat_conversation_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "chat_conversation_user_idx",
          fields: [{ name: "fk_user" }],
        },
      ],
    }
  );
};

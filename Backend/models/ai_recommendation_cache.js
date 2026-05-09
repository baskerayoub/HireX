module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "ai_recommendation_cache",
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
        comment: "User who owns this cache entry",
      },
      data_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "SHA-256 fingerprint of the analytics input data",
      },
      recommendations: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        comment: "JSON-stringified AI recommendations array",
      },
      ai_generated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "Timestamp when AI generated this result",
      },
      ai_version: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "1",
        comment: "Version tag for the recommendation algorithm",
      },
      input_snapshot: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON snapshot of input data for debugging",
      },
      ttl_expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "Cache expiration timestamp (24h TTL by default)",
      },
    },
    {
      sequelize,
      tableName: "ai_recommendation_cache",
      timestamps: true,
      indexes: [
        {
          name: "idx_user_hash",
          unique: true,
          fields: ["fk_user", "data_hash"],
        },
        {
          name: "idx_ttl",
          fields: ["ttl_expires_at"],
        },
      ],
    }
  );
};
